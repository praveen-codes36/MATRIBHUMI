export function errorHandler(err,req,res,next) {
  if(res.headersSent) return next(err);
  const status=err.name==='ZodError'||[16755,16756].includes(err.code)||['ValidationError','CastError','StrictModeError'].includes(err.name)?400:err.code===11000||err.name==='VersionError'?409:err.statusCode||err.status||500;
  res.status(status).json({success:false,statusCode:status,message:status>=500?'Service unavailable or internal error':err.code===11000?'Duplicate record':err.message,errors:err.name==='ZodError'?err.issues.map(i=>({path:i.path.join('.'),message:i.message})):[]});
}
