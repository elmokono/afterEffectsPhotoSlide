var duration = 3600
var fps = 29.97
var wallCount = 3
var frameSize = 800
var frameSeparation = 800
var wallSize
var wallSeparation = 2500
var mainComp, frameComp, solidBlackComp
var mediasFolder
var images = []
var sortedLayers = []

//find comps
for(var i=0;i<app.project.numItems;i++) {

        var item = app.project.items[i+1]
        if (item.name == 'Main') mainComp = item      
        if (item.name == 'PhotoFrame') frameComp = item    
        if (item.name == 'SolidBlack') solidBlackComp = item
        if (item.name == 'medias') mediasFolder = item      
        if (item.name == 'images') {        
            for(var n=0;n<item.numItems;n++) {            
                images.push(item.items[n+1])                
            }            
        }
}

//walls
wallSize = Math.ceil(Math.sqrt(images.length / wallCount, -2))

//duplicate media comp for each image

var wallIndex = 0
var wallItemIndex = 0
var layerX = 0
var layerY = 0
var offSet = 0
var blackLayer
for(var n=0;n<images.length;n++) {
            
        //var item = mediasFolder.items.addComp('Wall:'+wallIndex+'-Media:'+wallItemIndex, frameSize, frameSize, 1.33, duration, fps)
        var item = mediasFolder.items.addComp('Image'+n, frameSize, frameSize, 1.33, duration, fps)
        
        //black bg
        blackLayer = item.layers.add(solidBlackComp)        
        
        //image                
        var imageLayer = item.layers.add(images[n])               
        var scale = 100.0
        if (imageLayer.width > imageLayer.height) {
            scale = [100.0 * frameSize / imageLayer.width]
        } else {
            scale = [100.0 * frameSize / imageLayer.height]
        }
        imageLayer.scale.setValue([scale, scale])
        
        //frame
        item.layers.add(frameComp)
        
        var layer = mainComp.layers.add(item)
        layer.threeDLayer = true
        layer.motionBlur = true
        layer.moveToEnd()
        layer.position.setValue([layerX, layerY, wallSeparation * wallIndex])       
        sortedLayers.push(n)
        
        //position        
        layerX += frameSize + frameSeparation
        offSet++
        wallItemIndex++
        
       if (offSet == wallSize) {
            offSet = 0            
            layerX = 0
            layerY += frameSize + frameSeparation            
        }            
                
        if ((wallItemIndex) == Math.pow(wallSize, 2)) { 
            wallItemIndex = 0
            wallIndex++
            layerX = 0
            layerY = 0
            offSet = 0
        }
    
}

//camera keys
var cameraPosition
for(var i=0;i<mainComp.layers.length;i++) {
    if (mainComp.layers[i+1].name == 'cameraPosition') { cameraPosition = mainComp.layers[i+1] }
}

var keyCount = 1
var keyTime = 0.0
var fixCamX = -100 - frameSeparation - frameSize
var fixCamY = 250
var fixCamZ = -400
cameraPosition.position.addKey(keyTime)
cameraPosition.position.setValueAtKey(keyCount, [0.0, 0.0, 2000.0])
shuffle(sortedLayers)

for(var n=0;n<images.length;n++) {

    var layer = mainComp.layers.byName('Image'+sortedLayers[n])
    
    //scroll to next media during 2 seconds
    keyCount++
    keyTime += 2.0
    cameraPosition.position.addKey(keyTime)
    cameraPosition.position.setValueAtKey(keyCount, [layer.position.value[0] + (frameSize) + fixCamX, layer.position.value[1] - (frameSize) + fixCamY, layer.position.value[2] + fixCamZ])

    var easeIn = new KeyframeEase(0.5, 50);
    var easeOut = new KeyframeEase(0.75, 85);
    cameraPosition.position.setTemporalEaseAtKey(keyCount, [easeIn], [easeOut]);

    //stay on media for 8 seconds
    keyCount++
    keyTime += 8.0
    cameraPosition.position.addKey(keyTime)
    cameraPosition.position.setValueAtKey(keyCount, [layer.position.value[0] + (frameSize) + fixCamX, layer.position.value[1] - (frameSize) + fixCamY, layer.position.value[2] + fixCamZ])

}

mainComp.layers.byName('BG').moveToEnd()        

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
