export const nextWithdrawalDate = (currentWithdrawalDate) => {
    if (!currentWithdrawalDate) return;
    const currentToDate = new Date(currentWithdrawalDate);
    const today = new Date();
    let nextWithdrawalDate;
    if (today.setHours(0,0,0,0) >= currentToDate.setHours(0,0,0,0)) {
      
      nextWithdrawalDate = new Date(
        currentToDate.getFullYear(),
        currentToDate.getMonth() + 1,
        currentToDate.getDate()
      );
    } else {
      nextWithdrawalDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        currentToDate.getDate()
      );
    }
    return nextWithdrawalDate;
  };