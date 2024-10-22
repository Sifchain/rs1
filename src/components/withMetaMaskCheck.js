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
          if (router.pathname !== '/') {
            alert('MetaMask is not installed or available');
            router.push('/');  // Redirect to the index page if MetaMask is not available
          }
        } else if (!isConnected) {
          if (router.pathname !== '/') {
            router.push('/');  // Redirect to the index page if not connected
          }
        }
      }
    }, [isConnected, hasEthereum, loading, router]);

    // If it's the home page, we want to show the unconnected state as well
    if (router.pathname === '/') {
      return <WrappedComponent {...props} />;
    }

    // Render the wrapped component only if MetaMask is installed and connected
    if (loading) {
      return null;  // Optionally render a loading spinner or nothing during the loading phase
    }

    return hasEthereum && isConnected ? <WrappedComponent {...props} /> : null;
  };
};

export default withMetaMaskCheck;
