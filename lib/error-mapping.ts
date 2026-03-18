export const mapFirebaseError = (error: any): string => {
  const errorCode = error?.code || '';

  switch (errorCode) {
    // Login Errors
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    
    // Signup Errors
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    
    // General Errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    
    default:
      // Fallback to a generic message if the error code is unknown
      // but avoid showing the technical "Firebase: Error (auth/...)" string
      if (error?.message && !error.message.includes('Firebase:')) {
        return error.message;
      }
      return 'An unexpected error occurred. Please try again.';
  }
};
