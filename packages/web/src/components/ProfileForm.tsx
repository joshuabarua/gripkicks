import React, { useState } from 'react';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { ApiError } from '@/lib/errors';

interface ProfileData {
  name: string;
  phone?: string;
  image?: string;
}

export function ProfileForm() {
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    phone: '',
    image: '',
  });

  const updateProfile = (data: ProfileData) => {
    return fetchApi<void>('/api/v1/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  const { error, isLoading, isSuccess, isError, mutate, reset } = useMutation(updateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await mutate(formData);
    
    if (result.isOk()) {
      console.log('Profile updated successfully');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {isError && error && (
        <div className={`rounded-md p-4 ${
          getErrorSeverity(error) === 'error' ? 'bg-red-50' :
          getErrorSeverity(error) === 'warning' ? 'bg-yellow-50' :
          'bg-blue-50'
        }`}>
          <h3 className={`text-sm font-medium ${
            getErrorSeverity(error) === 'error' ? 'text-red-800' :
            getErrorSeverity(error) === 'warning' ? 'text-yellow-800' :
            'text-blue-800'
          }`}>
            {getErrorSeverity(error) === 'error' ? 'Error' :
             getErrorSeverity(error) === 'warning' ? 'Warning' :
             'Notice'}
          </h3>
          <p className={`mt-2 text-sm ${
            getErrorSeverity(error) === 'error' ? 'text-red-700' :
            getErrorSeverity(error) === 'warning' ? 'text-yellow-700' :
            'text-blue-700'
          }`}>
            {getErrorDisplayMessage(error)}
          </p>
        </div>
      )}

      {isSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <h3 className="text-sm font-medium text-green-800">Success</h3>
          <p className="mt-2 text-sm text-green-700">
            Profile updated successfully!
          </p>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>

        {(isSuccess || isError) && (
          <button
            type="button"
            onClick={reset}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
}

function getErrorDisplayMessage(error: ApiError): string {
  switch (error.type) {
    case 'UNAUTHENTICATED':
      return 'Please sign in to update your profile';
    case 'UNAUTHORIZED':
      return 'You don\'t have permission to update this profile';
    case 'INVALID_DATA':
      return 'Please check your input data for errors (e.g., invalid phone format, long name, or invalid URL)';
    case 'VALIDATION_ERROR':
      return 'Please fill in at least one field to update';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again';
    case 'TIMEOUT_ERROR':
      return 'Request timed out. Please try again';
    case 'UNEXPECTED_ERROR':
      return 'An unexpected error occurred. Please try again';
    case 'RANDOM_ERROR':
      return 'A random error occurred (this is for testing purposes)';
    default:
      return error.message || 'An error occurred while updating your profile.';
  }
}

function getErrorSeverity(error: ApiError): 'error' | 'warning' | 'info' {
  switch (error.type) {
    case 'UNAUTHENTICATED':
    case 'UNAUTHORIZED':
      return 'warning';
    case 'INVALID_DATA':
    case 'VALIDATION_ERROR':
      return 'info';
    case 'NETWORK_ERROR':
    case 'TIMEOUT_ERROR':
      return 'warning';
    case 'UNEXPECTED_ERROR':
    case 'RANDOM_ERROR':
      return 'error';
    default:
      return 'error';
  }
}
