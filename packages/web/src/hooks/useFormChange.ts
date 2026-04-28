import { useState, useCallback } from "react";

export function useFormChange<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return { formData, setFormData, handleChange };
}
