import { debounce } from 'es-toolkit';
import { cn } from '@/shared/utils/index';
import {
  ComponentProps,
  useState,
  useMemo,
  ChangeEvent,
  useEffect,
  forwardRef,
  useEffectEvent,
} from 'react';

interface InputProps extends Omit<ComponentProps<'input'>, 'onChange'> {
  allowDebouncing?: boolean;
  delay?: number;
  onChange?: (
    event: ChangeEvent<HTMLInputElement>,
    debounced?: boolean
  ) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      allowDebouncing = false,
      delay = 300,
      onChange,
      ...props
    },
    ref
  ) => {
    const [pendingEvent, setPendingEvent] = useState<
      ChangeEvent<HTMLInputElement> | undefined
    >();

    const debouncedOnChange = useMemo(
      () =>
        allowDebouncing
          ? debounce((e: ChangeEvent<HTMLInputElement>) => {
              onChange?.(e, true);
            }, delay)
          : undefined,
      [allowDebouncing, delay, onChange]
    );

    useEffect(() => {
      return () => {
        debouncedOnChange?.cancel();
      };
    }, [debouncedOnChange]);

    const onDebouncedOnChange = useEffectEvent(
      (e: ChangeEvent<HTMLInputElement>) => {
        debouncedOnChange?.(e);
      }
    );

    useEffect(() => {
      if (pendingEvent) {
        onDebouncedOnChange(pendingEvent);
      }
    }, [pendingEvent]);

    /**
     * Input change event handler
     * - Immediately calls onChange with debounced: false
     * - Triggers debounced callback for expensive operations
     */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      // Immediate callback for UI updates
      onChange?.(e, false);

      // Set pending event for debounced callback
      if (allowDebouncing) {
        setPendingEvent(e);
      }
    };

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, type InputProps };
