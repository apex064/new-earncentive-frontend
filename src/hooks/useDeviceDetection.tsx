// hooks/useDeviceDetection.tsx
'use client';

import { useEffect, useState } from 'react';
import { AppleFilled, AndroidFilled, WindowsFilled } from '@ant-design/icons';

export interface DeviceInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isWindows: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  platform: 'android' | 'ios' | 'windows' | 'other';
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isAndroid: false,
    isIOS: false,
    isWindows: false,
    isMobile: false,
    isDesktop: true,
    platform: 'other',
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isWindows = /windows/.test(userAgent);
    const isMobile = isAndroid || isIOS || /mobile/.test(userAgent);
    const isDesktop = !isMobile;
    
    let platform: 'android' | 'ios' | 'windows' | 'other' = 'other';
    if (isAndroid) platform = 'android';
    else if (isIOS) platform = 'ios';
    else if (isWindows) platform = 'windows';
    
    setDeviceInfo({
      isAndroid,
      isIOS,
      isWindows,
      isMobile,
      isDesktop,
      platform,
    });
  }, []);

  return deviceInfo;
}

// Platform icons renderer
export function usePlatformIcons() {
  const deviceInfo = useDeviceDetection();
  
  const getIconSize = (size: 'sm' | 'md' | 'lg' = 'sm') => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'md': return 'h-3.5 w-3.5';
      case 'lg': return 'h-4 w-4';
      default: return 'h-3 w-3';
    }
  };

  const renderPlatformIcons = ({ 
    osString, 
    size = 'sm' 
  }: { 
    osString?: string; 
    size?: 'sm' | 'md' | 'lg' 
  }) => {
    const iconSize = getIconSize(size);
    const icons: React.ReactNode[] = [];
    
    let showAndroid = false;
    let showIOS = false;
    let showWindows = false;
    
    if (osString) {
      const osLower = osString.toLowerCase();
      
      // Check for specific platform in API response
      const hasAndroid = osLower.includes('android');
      const hasIOS = osLower.includes('ios');
      const hasWindows = osLower.includes('windows') || osLower.includes('win');
      const hasAll = osLower.includes('any') || osLower.includes('all') || osLower === '' || osLower === 'any';
      
      if (hasAndroid) {
        // API specifically returned Android - show only Android
        showAndroid = true;
      } else if (hasIOS) {
        // API specifically returned iOS - show only iOS
        showIOS = true;
      } else if (hasWindows) {
        // API specifically returned Windows - show only Windows
        showWindows = true;
      } else if (hasAll) {
        // API returned "all" or empty - use device detection
        showAndroid = deviceInfo.isAndroid;
        showIOS = deviceInfo.isIOS;
        showWindows = deviceInfo.isWindows;
        
        // Fallback: if device detection shows no platform, show all icons
        if (!showAndroid && !showIOS && !showWindows) {
          showAndroid = true;
          showIOS = true;
          showWindows = true;
        }
      } else {
        // Unknown platform - show all icons as fallback
        showAndroid = true;
        showIOS = true;
        showWindows = true;
      }
    } else {
      // No API platform info - use device detection
      showAndroid = deviceInfo.isAndroid;
      showIOS = deviceInfo.isIOS;
      showWindows = deviceInfo.isWindows;
      
      // Fallback: if device detection shows no platform, show all icons
      if (!showAndroid && !showIOS && !showWindows) {
        showAndroid = true;
        showIOS = true;
        showWindows = true;
      }
    }
    
    if (showAndroid) {
      icons.push(<AndroidFilled key="android" className={`${iconSize} text-success`} />);
    }
    if (showIOS) {
      icons.push(<AppleFilled key="ios" className={`${iconSize} text-muted-foreground`} />);
    }
    if (showWindows) {
      icons.push(<WindowsFilled key="windows" className={`${iconSize} text-info`} />);
    }
    
    return (
      <div className="flex items-center gap-1">
        {icons}
      </div>
    );
  };

  return { renderPlatformIcons };
}