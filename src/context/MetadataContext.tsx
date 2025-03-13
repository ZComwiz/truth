import React, { createContext, useContext } from 'react';

interface MetadataContextType {
  title: string;
  coverImage: string;
}

export const MetadataContext = createContext<MetadataContextType>({
  title: '',
  coverImage: ''
});

export const useMetadata = () => useContext(MetadataContext); 