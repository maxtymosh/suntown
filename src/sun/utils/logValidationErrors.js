const formatError = (err) => {
  let errors = Object.entries(err.errors);
  const errorMessages = errors.map(error => {
    if(error[1].properties.type === 'unique'){
      return error[1].properties.message
    } else return
  });
  return errorMessages
}

module.exports = formatError;