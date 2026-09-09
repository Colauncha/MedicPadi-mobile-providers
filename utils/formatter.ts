export const formatTime = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const formatDate = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'long',
    });
  } catch {
    return '';
  }
};
