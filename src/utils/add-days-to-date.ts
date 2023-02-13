export const addDaysToCurrentDate = (noOfDays) => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + noOfDays)
   return currentDate;                
}