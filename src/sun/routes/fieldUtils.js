function verifyFields(req, res, next){
  const errors = req.body.map(field => {
    console.log(field)
  })
  next()
}

module.exports = verifyFields;