//@ts-nocheck
import { useEffect, useState } from 'react';

const useDebounce = (value, timer = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(null);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (value !== null) {
                setDebouncedValue(value);
            }
        }, timer);

        return () => {
            clearTimeout(delay);
        };
    }, [value, timer]);

    return [debouncedValue];
};

export default useDebounce;
