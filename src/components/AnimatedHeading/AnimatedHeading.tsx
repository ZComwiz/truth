import React, { useEffect, useState } from 'react';
import { motion, useAnimationControls, useScroll, useTransform } from 'framer-motion';
import styles from './styles.module.css';

interface AnimatedHeadingProps {
  children: React.ReactNode;
}

export function AnimatedHeading({ children }: AnimatedHeadingProps) {
  const { scrollY } = useScroll();
  
  const textShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 20px rgba(255, 215, 0, 0.1)', '0 0 30px rgba(255, 215, 0, 0.2)']
  );

  return (
    <motion.h1
      className={styles.mysticalHeading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textShadow }}
    >
      <span className={styles.gradientText}>
        {children}
      </span>
    </motion.h1>
  );
} 

export default AnimatedHeading;