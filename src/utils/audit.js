module.exports.audit = (actorId, action, meta = {}) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[AUDIT]', JSON.stringify({
      ts: new Date().toISOString(),
      actorId,
      action,
      meta,
    }));
  }
};
