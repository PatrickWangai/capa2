import Joi from 'joi';

export default (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
    });
  }
  req[target] = value;
  next();
}
