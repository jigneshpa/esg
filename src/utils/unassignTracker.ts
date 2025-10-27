// Global tracker for unassign operations
// This prevents generateQuestionnaire from being called during unassign operations

let isUnassignOperationActive = false;

export const setUnassignOperationActive = (active: boolean) => {
  console.log('🔒 setUnassignOperationActive:', active);
  isUnassignOperationActive = active;

  // AGGRESSIVE SAFEGUARD: Set window global that can be checked anywhere
  if (typeof window !== 'undefined') {
    (window as any).__UNASSIGN_OPERATION_ACTIVE__ = active;
    console.log('🌍 Window global __UNASSIGN_OPERATION_ACTIVE__ set to:', active);
  }
};

export const isUnassignOperationInProgress = () => {
  console.log('🔍 isUnassignOperationInProgress:', isUnassignOperationActive);
  return isUnassignOperationActive;
};

export const withUnassignProtection = <T extends any[], R>(
  fn: (...args: T) => R,
  operationName: string
): ((...args: T) => R) => {
  return (...args: T): R => {
    if (isUnassignOperationActive) {
      console.log(`🛑 BLOCKED ${operationName} because unassign operation is active`);
      return undefined as R;
    }
    return fn(...args);
  };
};
