import React from 'react';
import { ProvinceDetailedPanel } from './ProvinceDetailedPanel.tsx';

interface TeteDetailedPanelProps {
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string | null) => void;
  onReturnToNational: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TeteDetailedPanel: React.FC<TeteDetailedPanelProps> = (props) => {
  return <ProvinceDetailedPanel provinceId="07" {...props} />;
};
