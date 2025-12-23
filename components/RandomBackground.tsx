'use client';

import { memo } from 'react';

/**
 * 简化版背景组件 - 性能优化
 * 使用纯色渐变,移除图片加载
 */
const RandomBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50" />
    </div>
  );
});

RandomBackground.displayName = 'RandomBackground';

export default RandomBackground;
