import React from 'react';
import { usePagination, DOTS } from '../../../hooks/usePagination'; 
import styles from './Pagination.module.scss';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface PaginationProps {
    onPageChange: (page: number) => void;
    totalCount: number;
    siblingCount?: number;
    currentPage: number;
    pageSize: number;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    onPageChange, totalCount, siblingCount = 1, currentPage, pageSize, className = ''
}) => {
    const paginationRange = usePagination({ currentPage, totalCount, siblingCount, pageSize });

    if (currentPage === 0 || paginationRange.length < 2) return null;

    const onNext = () => onPageChange(currentPage + 1);
    const onPrevious = () => onPageChange(currentPage - 1);

    const lastPage = paginationRange[paginationRange.length - 1];

    return (
        <ul className={`${styles.paginationContainer} ${className}`}>
            <li className={`${styles.paginationItem} ${currentPage === 1 ? styles.disabled : ''}`} onClick={onPrevious}>
                <ArrowBackIosNewIcon />
            </li>
            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                    return <li key={index} className={`${styles.paginationItem} ${styles.dots}`}>&#8230;</li>;
                }
                return (
                    <li key={index} className={`${styles.paginationItem} ${pageNumber === currentPage ? styles.selected : ''}`} onClick={() => onPageChange(pageNumber as number)}>
                        {pageNumber}
                    </li>
                );
            })}
            <li className={`${styles.paginationItem} ${currentPage === lastPage ? styles.disabled : ''}`} onClick={onNext}>
                <ArrowForwardIosIcon />
            </li>
        </ul>
    );
};

export default Pagination;