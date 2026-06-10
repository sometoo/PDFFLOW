import React from 'react';

// Set to true after AdSense approval to enable ad scripts
const ADSENSE_ENABLED = false;

interface AdSlotProps {
  slotId: string;
  className?: string;
}

const AdSlot: React.FC<AdSlotProps> = ({ slotId, className = "" }) => {
  if (!ADSENSE_ENABLED) {
    return null; // Absolutely hidden in 1st stage MVP
  }

  return (
    <div className={`my-6 flex justify-center w-full ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client="ca-pub-sometoo-placeholder"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
export { ADSENSE_ENABLED };
