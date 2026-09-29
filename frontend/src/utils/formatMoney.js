export const formatNumberWithThousands = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const number = String(value).replace(/\D/g, "");

  if (!number) {
    return "";
  }

  return Number(number).toLocaleString("es-CO");
};

export const cleanNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value).replace(/\./g, "");
};
