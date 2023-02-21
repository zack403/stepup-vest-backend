export const nextWithdrawalDate = (currentWithdrawalDate) => {
    if (!currentWithdrawalDate) return;
    const currentToDate = new Date(currentWithdrawalDate);
    const today = new Date();
    let nextWithdrawalDate;
    if (today.getDate() > currentToDate.getDate()) {
      nextWithdrawalDate = new Date(
        currentToDate.getFullYear(),
        currentToDate.getMonth() + 1,
        currentToDate.getDate()
      );
    } else {
      nextWithdrawalDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        currentToDate.getDate()
      );
    }
    return nextWithdrawalDate;
  };