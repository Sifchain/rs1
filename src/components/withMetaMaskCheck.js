import { useEffect } from 'react';
import { useAccount } from '../hooks/useMetaMask'; // Custom MetaMask hook
import { useRouter } from 'next/router';

const withMetaMaskCheck = (WrappedComponent) => {
  return (props) => {
    const { isConnected, hasEthereum, loading } = useAccount();  // Now checking both connection and Ethereum availability
    const router = useRouter();

    useEffect(() => {
      if (!loading) {  // Wait until the loading state is done
        if (!hasEthereum) {
          alert('MetaMask is not installed or available');
          router.push('/');  // Redirect to the index page if MetaMask is not available
        } else if (!isConnected) {
          router.push('/');  // Redirect to the index page if not connected
        }
      }
    }, [isConnected, hasEthereum, loading, router]);

    // Render the wrapped component only if loading is false and connected
    if (loading) {
      return null;  // Optionally render a loading spinner or nothing during the loading phase
    }

    return hasEthereum && isConnected ? <WrappedComponent {...props} /> : null;
  };
};

export default withMetaMaskCheck;
