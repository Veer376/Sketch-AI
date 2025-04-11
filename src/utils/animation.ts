/**
 * Utility functions for animations in the canvas application
 */

/**
 * Creates a spring animation effect that bounces to the target value
 * @param from Starting value
 * @param to Target value
 * @param duration Duration in milliseconds
 * @param callback Function called on each animation frame with the current value
 * @param dampingRatio Controls the bounciness (0.8-1.0 = slight bounce, 0.5-0.8 = moderate bounce)
 * @param frequency Controls the speed (higher = faster oscillation)
 */
export const springAnimation = (
  from: number,
  to: number,
  duration: number,
  callback: (value: number) => void,
  dampingRatio: number = 0.7, // Moderate bounce by default
  frequency: number = 20 // Animation speed
): { stop: () => void } => {
  const startTime = Date.now();
  let animationFrame: number;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    if (progress < 1) {
      // Spring physics equation for damped harmonic motion
      const decay = Math.exp(-dampingRatio * frequency * progress);
      const oscillation = decay * Math.sin(frequency * progress);
      
      // Calculate current position with bouncy effect
      const value = to + (from - to) * (decay * Math.cos(frequency * progress) + oscillation);
      
      callback(value);
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Ensure we end exactly at the target value
      callback(to);
    }
  };
  
  animationFrame = requestAnimationFrame(animate);
  
  return {
    stop: () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }
  };
};

/**
 * Creates a bouncy scale animation for UI elements
 * @param element DOM element to animate
 * @param scale Target scale (usually 1.0 for normal size)
 * @param duration Duration in milliseconds
 */
export const bounceUIElement = (
  element: HTMLElement,
  scale: number = 1.0,
  duration: number = 300
): void => {
  // Start slightly smaller or larger depending on target
  const startScale = scale < 1 ? 1.2 : 0.8;
  
  // Apply initial scale
  element.style.transition = 'none';
  element.style.transform = `scale(${startScale})`;
  
  // Force repaint
  element.offsetHeight;
  
  // Reset transition and animate to target scale with bouncy effect
  element.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  element.style.transform = `scale(${scale})`;
};