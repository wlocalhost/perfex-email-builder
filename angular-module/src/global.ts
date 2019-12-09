let GlobalVariable = {};

if (process.env.NODE_ENV === 'production') {
  GlobalVariable = (window as any).GlobalVariable;
} else {
  GlobalVariable = {
    API_BASE: '/admin/email_builder',
    CSRF: {
      name: 'csrf_token_name',
      token: '164a0cd68d304ee3cd08cc029962ad79'
    },
    ...(window as any).GlobalVariable
  };
}

export default Object.freeze(GlobalVariable) as any;
