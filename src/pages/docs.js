import { useEffect } from 'react';

function Docs() {

  useEffect(() => {
    window.location.href = 'https://sifchain.github.io/sa-eliza/#/README';
  }, []);

  return null;
}

export default Docs;
