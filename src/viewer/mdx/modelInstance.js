function ModelInstance(model) {
  var i, l, objects;
  
  this.model = model;
  this.sequence = -1;
  this.frame = 0;
  this.counter = 0;
  this.loopingMode = 0;
  this.skeleton = new Skeleton(model);
  
  if (model.particleEmitters && model.particleEmitters.length > 0) {
    objects = model.particleEmitters;

    this.particleEmitters = [];
    
    for (i = 0, l = objects.length; i < l; i++) {
      this.particleEmitters[i] = new ParticleEmitter(objects[i], model, this);
    }
  }
  
  if (model.particleEmitters2 && model.particleEmitters2.length > 0) {
    objects = model.particleEmitters2;

    this.particleEmitters2 = [];
    
    for (i = 0, l = objects.length; i < l; i++) {
      this.particleEmitters2[i] = new ParticleEmitter2(objects[i], model, this);
    }
  }

  if (model.ribbonEmitters && model.ribbonEmitters.length > 0) {
    objects = model.ribbonEmitters;

    this.ribbonEmitters = [];
    
    for (i = 0, l = objects.length; i < l; i++) {
      this.ribbonEmitters[i] = new RibbonEmitter(objects[i], model, this);
    }
  }
  
  this.meshVisibilities = [];
  
  for (i = 0, l = model.meshes.length; i < l; i++) {
    this.meshVisibilities[i] = true;
  }
}

ModelInstance.prototype = {
  updateEmitters: function (emitters, allowCreate, context) {
    if (emitters) {
      for (var i = 0, l = emitters.length; i < l; i++) {
        emitters[i].update(allowCreate, this.sequence, this.frame, this.counter, context.particleRect, context.particleBillboardedRect);
      }
    }
  },
  
  update: function (instance, context) {
    var allowCreate = false;
    var frames = 960 * FRAME_TIME;
    
    if (this.sequence !== -1) {
      var sequence = this.model.sequences[this.sequence];
      
      this.frame += frames;
      this.counter += frames;
      
      allowCreate = true;
      
      if (this.frame >= sequence.interval[1]) {
        if (this.loopingMode === 2 || (this.loopingMode === 0 && sequence.flags === 0)) {
          this.frame = sequence.interval[0];
          allowCreate = true;
        } else {
          this.frame = sequence.interval[1];
          this.couter -= frames;
          allowCreate = false;
        }
      }
    }
    
    this.skeleton.update(this.sequence, this.frame, this.counter, instance);
    
    this.updateEmitters(this.particleEmitters, allowCreate, context);
    this.updateEmitters(this.particleEmitters2, allowCreate, context);
    this.updateEmitters(this.ribbonEmitters, allowCreate, context);
  },
  
  render: function (instance, context) {
    this.model.render(this, instance.textureMap, context);
  },
  
  renderEmitters: function (instance, context) {
    this.model.renderEmitters(this, instance.textureMap, context);
  },
  
  renderColor: function (instance) {
    this.model.renderColor(this, instance.color);
  },
  
  setSequence: function (id) {
    this.sequence = id;
    
    if (id === -1) {
      this.frame = 0;
    } else {
      var sequence = this.model.sequences[id];
      
      this.frame = sequence.interval[0];
    }
  },
  
  setSequenceLoopMode: function (looping) {
    this.loopingMode = math.clamp(looping, 0, 2);
  },
  
  getAttachment: function (id) {
    var attachment = this.model.attachments[id];
    
    if (attachment) {
      return this.skeleton.nodes[attachment.node];
    } else {
      return this.skeleton.nodes[0];
    }
  },
  
  getMeshVisibilities: function () {
    return Array.copy(this.meshVisibilities);
  },
  
  setMeshVisibility: function (meshId, b) {
    this.meshVisibilities[meshId] = b;
  },
  
  getMeshVisibility: function (meshId) {
    return this.meshVisibilities[meshId];
  }
};