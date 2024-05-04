'use client';
import Script from 'next/script';

type CSEProps = {
  type: 'searchbox' | 'searchresults';
};

const CSE: React.FC<CSEProps> = ({ type }) => {
  const cse = process.env.NEXT_PUBLIC_CSE_ID ?? '';
  const scriptUrl = `https://cse.google.com/cse.js?cx=${cse}`;
  return (
    <>
      <Script src={scriptUrl} />
      {type === 'searchbox' && <div className="gcse-searchbox-only"></div>}
      {type === 'searchresults' && <div className="gcse-searchresults-only"></div>}
    </>
  );
};

export default CSE;
