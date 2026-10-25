import React from 'react';
import { Skeleton } from '@mui/material';
import styles from './CardSkeletonGrid.module.scss';

interface CardSkeletonGridProps {
  count?: number; 
  imageHeight?: number; 
}

const CardSkeletonGrid: React.FC<CardSkeletonGridProps> = ({ 
  count = 4, 
  imageHeight = 350 
}) => {
  return (
    <div className={styles['skeleton-grid']}>
      {Array.from(new Array(count)).map((_, index) => (
        <div key={index} className={styles['skeleton-card']}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={imageHeight} 
            sx={{ borderRadius: '12px', marginBottom: '1rem' }} 
            animation="wave"
          />
          
          <Skeleton 
            variant="text" 
            width="80%" 
            height={30} 
            animation="wave"
            sx={{ marginBottom: '0.5rem' }} 
          />
          
          <Skeleton 
            variant="text" 
            width="50%" 
            height={20} 
            animation="wave" 
          />
        </div>
      ))}
    </div>
  );
};

export default CardSkeletonGrid;