import { renderHook } from "@testing-library/react";
import usePrevious from "./usePrevious";

describe("usePrevious", () => {
	it("returns undefined on initial render", () => {
		const { result } = renderHook(() => usePrevious(10));

		expect(result.current).toBeUndefined();
	});

	it("returns previous value after update", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: number }) => usePrevious(value),
			{ initialProps: { value: 10 } },
		);

		expect(result.current).toBeUndefined();

		rerender({ value: 20 });

		expect(result.current).toBe(10);
	});

	it("tracks value changes through multiple updates", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: number }) => usePrevious(value),
			{ initialProps: { value: 1 } },
		);

		rerender({ value: 2 });
		expect(result.current).toBe(1);

		rerender({ value: 3 });
		expect(result.current).toBe(2);

		rerender({ value: 4 });
		expect(result.current).toBe(3);
	});

	it("works with string values", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: string }) => usePrevious(value),
			{ initialProps: { value: "initial" } },
		);

		rerender({ value: "updated" });

		expect(result.current).toBe("initial");
	});

	it("works with object values", () => {
		const obj1 = { id: 1, name: "Item 1" };
		const obj2 = { id: 2, name: "Item 2" };

		const { result, rerender } = renderHook(
			({ value }: { value: typeof obj1 }) => usePrevious(value),
			{ initialProps: { value: obj1 } },
		);

		rerender({ value: obj2 });

		expect(result.current).toBe(obj1);
		expect(result.current?.name).toBe("Item 1");
	});

	it("works with null values", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: number | null }) => usePrevious(value),
			{ initialProps: { value: 10 } },
		);

		rerender({ value: null as unknown as number });

		expect(result.current).toBe(10);

		rerender({ value: 20 });

		expect(result.current).toBeNull();
	});

	it("updates previous value on every render with new value", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: number }) => usePrevious(value),
			{ initialProps: { value: 10 } },
		);

		rerender({ value: 20 });
		expect(result.current).toBe(10);

		// Rerender with same value, previous should still update to current
		rerender({ value: 20 });
		expect(result.current).toBe(20);

		rerender({ value: 30 });
		expect(result.current).toBe(20);
	});
});
