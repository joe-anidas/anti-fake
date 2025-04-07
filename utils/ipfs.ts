// utils/ipfs.ts

export const uploadFileToIPFS = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch('/api/ipfs/upload-file', {
        method: 'POST',
        body: formData // Don't set Content-Type header here
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
  
      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to upload file to IPFS'
      );
    }
  };
  export const uploadJSONToIPFS = async (jsonData: Record<string, any>) => {
    try {
      const response = await fetch('/api/ipfs/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: jsonData,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload JSON to IPFS');
      }
  
      const data = await response.json();
      return { cid: data.IpfsHash };
    } catch (error) {
      console.error('Error uploading JSON:', error);
      throw new Error('JSON upload failed');
    }
  };
  
  // Helper function to convert File to Base64
  export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
      reader.onerror = error => reject(error);
    });
  };