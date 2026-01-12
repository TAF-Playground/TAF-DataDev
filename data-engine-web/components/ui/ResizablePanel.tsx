'use client';

import { useState, useRef, useEffect, ReactNode, Fragment } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: 'horizontal' | 'vertical';
  onResize?: (size: number) => void;
}

export function ResizablePanel({ 
  children, 
  defaultSize = 50, 
  minSize = 10, 
  maxSize = 90,
  direction = 'horizontal',
  onResize 
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newSize: number;

      if (direction === 'horizontal') {
        const x = e.clientX - rect.left;
        newSize = (x / rect.width) * 100;
      } else {
        const y = e.clientY - rect.top;
        newSize = (y / rect.height) * 100;
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
      onResize?.(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minSize, maxSize, direction, onResize]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  return (
    <div
      ref={containerRef}
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} h-full w-full`}
    >
      <div
        ref={panelRef}
        className="overflow-hidden"
        style={{
          [direction === 'horizontal' ? 'width' : 'height']: `${size}%`,
        }}
      >
        {children}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={`${
          direction === 'horizontal'
            ? 'w-1 cursor-col-resize hover:bg-blue-500'
            : 'h-1 cursor-row-resize hover:bg-blue-500'
        } bg-gray-600 transition-colors ${isResizing ? 'bg-blue-500' : ''}`}
      />
    </div>
  );
}

interface ResizablePanelsProps {
  children: ReactNode[];
  direction?: 'horizontal' | 'vertical';
  defaultSizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
}

export function ResizablePanels({
  children,
  direction = 'horizontal',
  defaultSizes = [],
  minSizes = [],
  maxSizes = [],
}: ResizablePanelsProps) {
  const [sizes, setSizes] = useState<number[]>(() => {
    if (defaultSizes.length > 0 && defaultSizes.length === children.length) {
      return defaultSizes;
    }
    // 默认平均分配
    const equalSize = 100 / children.length;
    return children.map(() => equalSize);
  });

  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [startPosition, setStartPosition] = useState<number>(0);
  const [startSizes, setStartSizes] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingIndex(index);
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = direction === 'horizontal' 
      ? e.clientX - rect.left 
      : e.clientY - rect.top;
    
    setStartPosition(position);
    setStartSizes([...sizes]);
  };

  useEffect(() => {
    if (resizingIndex === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || resizingIndex === null) return;

      const rect = containerRef.current.getBoundingClientRect();
      let currentPosition: number;

      if (direction === 'horizontal') {
        currentPosition = e.clientX - rect.left;
      } else {
        currentPosition = e.clientY - rect.top;
      }

      const containerSize = direction === 'horizontal' ? rect.width : rect.height;
      const diff = ((currentPosition - startPosition) / containerSize) * 100;

      const newSizes = [...startSizes];
      const currentSize = startSizes[resizingIndex];
      const nextSize = startSizes[resizingIndex + 1];

      const minSize1 = minSizes[resizingIndex] || 10;
      const maxSize1 = maxSizes[resizingIndex] || 90;
      const minSize2 = minSizes[resizingIndex + 1] || 10;
      const maxSize2 = maxSizes[resizingIndex + 1] || 90;

      const newSize1 = Math.max(minSize1, Math.min(maxSize1, currentSize + diff));
      const newSize2 = Math.max(minSize2, Math.min(maxSize2, nextSize - diff));

      // 确保总和不变
      const totalSize = newSize1 + newSize2;
      if (Math.abs(totalSize - (currentSize + nextSize)) < 0.1) {
        newSizes[resizingIndex] = newSize1;
        newSizes[resizingIndex + 1] = newSize2;
        setSizes(newSizes);
      }
    };

    const handleMouseUp = () => {
      setResizingIndex(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingIndex, startPosition, startSizes, direction, minSizes, maxSizes]);

  return (
    <div
      ref={containerRef}
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} h-full w-full`}
    >
      {children.map((child, index) => (
        <Fragment key={index}>
          <div
            className="overflow-hidden flex-shrink-0"
            style={{
              [direction === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%`,
              [direction === 'horizontal' ? 'height' : 'width']: '100%',
            }}
          >
            {child}
          </div>
          {index < children.length - 1 && (
            <div
              onMouseDown={(e) => handleMouseDown(index, e)}
              className={`${
                direction === 'horizontal'
                  ? 'w-1 cursor-col-resize hover:bg-blue-500'
                  : 'h-1 cursor-row-resize hover:bg-blue-500'
              } bg-gray-600 transition-colors flex-shrink-0 ${
                resizingIndex === index ? 'bg-blue-500' : ''
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
