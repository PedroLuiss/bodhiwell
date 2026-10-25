import React, { useState, useRef, useEffect } from 'react';
import styles from './ActionMenu.module.scss';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import classNames from 'classnames';

interface ActionMenuProps {
  options: React.ReactNode[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const parentRow = menuRef.current.closest('tr');
      if (parentRow) {
        const originalZIndex = parentRow.style.zIndex;
        const originalPosition = parentRow.style.position;
        parentRow.style.zIndex = '100'; 
        parentRow.style.position = 'relative';
        return () => {
          parentRow.style.zIndex = originalZIndex;
          parentRow.style.position = originalPosition;
        };
      }
    }
  }, [isOpen]);

  return (
    <div className={classNames(styles['action-menu'], { [styles['action-menu--active']]: isOpen })} ref={menuRef}>
      <button 
        className={styles['action-menu__trigger']} 
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Opciones"
      >
        <MoreVertIcon sx={{ fontSize: 20 }} />
      </button>

      {isOpen && (
        <div className={styles['action-menu__dropdown']}>
          <div className={styles['action-menu__list']}>
            {options.map((option, index) => (
              <div 
                key={index} 
                className={styles['action-menu__item']} 
                onClick={() => setIsOpen(false)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;