export const useTransformers = () => {
  const adminTransformer = (admin: any) => {
    return {
      email: admin.email,
      name: admin.name,
      id: admin.id,
    };
  };
  return { adminTransformer };
};
