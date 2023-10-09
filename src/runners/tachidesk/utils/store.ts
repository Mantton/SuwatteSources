export const SuwayomiStore = {
  host: () => ObjectStore.string("host"),
};

export const getHost = async () => {
  let host = await SuwayomiStore.host();
  if (!host)
    throw new Error(
      "Server URL not set!\nYou can set this in the source preferences menu."
    );
  if (host.endsWith("/")) return host.slice(0, -1);
  return host;
};
