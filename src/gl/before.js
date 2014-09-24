function GL(element, onload, onerror, onprogress, onloadstart, unboundonerror) {
  var ctx;
  var identifiers = ["webgl", "experimental-webgl"];
  
  for (var i = 0, l = identifiers.length; i < l; ++i) {
    try {
      ctx = element.getContext(identifiers[i], {antialias: true, alpha: false});
    } catch(e) {}

    if (ctx) {
      break;
    }
  }
  
  if (!ctx) {
    unboundonerror({isGL: true}, "WebGLContext");
    return;
  }
  
  var hasVertexTexture = ctx.getParameter(ctx.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;
  var hasFloatTexture = ctx.getExtension("OES_texture_float");
  var compressedTextures = ctx.getExtension("WEBGL_compressed_texture_s3tc");
  
  if (!hasVertexTexture) {
    unboundonerror({isGL: true}, "VertexTexture");
    return;
  }
  
  if (!hasFloatTexture) {
    unboundonerror({isGL: true}, "FloatTexture");
    return;
  }
  
  if (!compressedTextures) {
    unboundonerror({isGL: true}, "CompressedTextures");
  }
  
  var refreshViewProjectionMatrix = false;
  var projectionMatrix = mat4.create();
  var viewMatrix = mat4.create();
  var viewProjectionMatrix = mat4.create();
  var matrixStack = [];
  var textureStore = {};
  var shaderUnitStore = {};
  var shaderStore = {};
  var boundShader;
  var boundShaderName = "";
  var boundTextures = [];
  var floatPrecision = "precision mediump float;\n";
      
  ctx.viewport(0, 0, element.clientWidth, element.clientHeight);
  ctx.depthFunc(ctx.LEQUAL);
  ctx.enable(ctx.DEPTH_TEST);
  ctx.enable(ctx.CULL_FACE);
  
  function textureOptions(wrapS, wrapT, magFilter, minFilter) {
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, wrapS);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, wrapT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, magFilter);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, minFilter);
  }