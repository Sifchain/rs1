import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
} from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

export const config = getDefaultConfig({
  appName: 'RealitySpiral',
  projectId: '81960af0b67e231931085f566f12d6d4',
  chains: [
    mainnet,
  ],
  ssr: true,
});

export const myCustomTheme = {
    blurs: {
      modalOverlay: "#0079CF",
    },
    colors: {
      accentColor: "#0079CF",
      accentColorForeground: "#FFFFFF",
      actionButtonBorder: "#0079CF",
      actionButtonBorderMobile: "#FFFFFF",
      actionButtonSecondaryBackground: "#FFFFFF",
      closeButton: "#FFFFFF",
      closeButtonBackground: "#0079CF",
      connectButtonBackground: "#0079CF",
      connectButtonBackgroundError: "#0079CF",
      connectButtonInnerBackground: "#0079CF",
      connectButtonText: "#FFFFFF",
      connectButtonTextError: "#FFFFFF",
      connectionIndicator: "4ACAFF",
      downloadBottomCardBackground: "4ACAFF",
      downloadTopCardBackground: "#ffffff",
      error: "4ACAFF",
      generalBorder: "#FFFFFF",
      generalBorderDim: "#FFFFFF",
      modalBackground: "#000000",
      modalTextSecondary: "#FFFFFF",
      menuItemBackground: "000000",
      modalBorder: "#3c3c3c",
      modalText: "#0079CF",
      selectedOptionBorder: "#FFFFFF",
      modalBackdrop: "",
      modalTextDim: "#0079CF",
      profileAction: "#000000",
      profileActionHover: "#396475",
      standby: "#0079CF",
      profileForeground: "#000000",
    },
    radii: {
      actionButton: "10px",
      connectButton: "10px",
      menuButton: "10px",
      modal: "10px",
      modalMobile: "10px",
    },
    fonts: {
      body: "Poppins, sans-serif",
    },
    shadows: {
      connectButton: '...',
      dialog: '...',
      profileDetailsAction: '...',
      selectedOption: '...',
      selectedWallet: '...',
      walletLogo: '...',
    }, // Add the missing 'shadows' property
  };