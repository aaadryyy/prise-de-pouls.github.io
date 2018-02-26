
      const docWidth = 595.28;   
      const docHeight = 841.89;
      
      const pictureWidth = (docWidth / 297) * 100;
      const pictureHeigth = (docHeight / 297) * 70;
      
      const heightOffset = 40;      

      const localCanvas = document.createElement('canvas');
      localCanvas.height = 841.89;
      localCanvas.width = 595.28;

     const myCanvasContext = localCanvas.getContext("2d");
     

     
     var submittedPhotoList = new Array();
     var submittedPhotoCounter = 0;
     var newPhotoSubmitted = 0;
     
     var NEW_SUBMISSION = 1;
     var numberOfSubmittedPhoto = 0;
     
     
     var galleryUploader = new qq.FineUploader({
         element: document.getElementById("fine-uploader-gallery"),
         template: 'qq-template-gallery',
         request: {
            endpoint: '/server/uploads'
         },
         thumbnails: {
            placeholders: {
               waitingPath: '/javascript_lib/fine_uploader/processing.gif',
               notAvailablePath: '/source/placeholders/not_available-generic.png'
            }
         },
         callbacks :{
            onSubmit: function(id, name) {
              // get extension of the file
              var extension = qq.getExtension(name);
              // Remove extension of the file name
              var nameSansExtension = 
              name.replace(new RegExp('.' + extension + '$'), '');
              // Rename file without extension
              this.setName(id, nameSansExtension);
              submittedPhotoList.push(id);
              submittedPhotoCounter++;
              if (NEW_SUBMISSION == 1) {
                  newPhotoSubmitted = this.getUploads().length - numberOfSubmittedPhoto;
                  numberOfSubmittedPhoto += newPhotoSubmitted;
                  NEW_SUBMISSION = 0;
              }
            },
            onSubmitted : function(id){
               if (submittedPhotoCounter == newPhotoSubmitted){
                  loadImages();
                  NEW_SUBMISSION = 1;
                  submittedPhotoCounter = 0;
               }
            },   
            onCancel: function(id,name){
               submittedPhotoList.splice(submittedPhotoList.indexOf(id), 1);
               loadImages();
            },
         },
         validation: {
            allowedExtensions: ['jpeg', 'jpg', 'gif', 'png']
         },
         autoUpload: false,
         debug: true
      });
      
      
      
     
      ////////////// EVENT LISTENER ////////////////////////////////////////////
      document.getElementById('getPDF').addEventListener("click", function(){
         createPDF();
      });
     
      ///************************
     
   // Load images
   function loadImages() {
      
      //addCanvasToPDF();
      drawCanvas();
      //loadImagesIntoBigCanvas();
   }
   




   var canvasList = new Array();
   var loadedImage = new Array();
   var doc = new jsPDF("p", "mm", "a4");
	

   
   function drawCanvas(){
      loadtotal = submittedPhotoList.length;     
      for (i = 0; i < loadtotal; i++) {
         
         loadedImage[i] = new Image();
         canvasList[i] = document.createElement('canvas');
         var file = galleryUploader.getFile(submittedPhotoList[i]);
         
         
         
         loadedImage[i].onload = drawPhoto(
                                          canvasList[i],
                                          loadedImage[i],
                                          pictureWidth,
                                          pictureHeigth
                                          );
         loadedImage[i].src = URL.createObjectURL(file);
         loadedImage[i].name = galleryUploader.getFile(submittedPhotoList[i]).name;
      }
   }
   
   var photoNameOffset = 50;
   
   
   
   
   ///      |
   ///      |  heightOffset
   ///      V  
   ///
   ///
   ///
   ///
   ///
   /// CREATION DU PDF
   function addCanvasToPDF(){
      var pixToMm = 210 / docWidth;
      loadtotal = submittedPhotoList.length;
      var photoPlusNameHeight = 100 + photoNameOffset*2;
      var column = 2;
      var row = Math.ceil(loadtotal / column); 
      var rowByPage = Math.floor(docHeight / photoPlusNameHeight);
      var rowByPageFirstPage = Math.floor( (docHeight - heightOffset * 2)  / photoPlusNameHeight);
      var pages = Math.floor(row / rowByPageFirstPage) + Math.ceil((row-rowByPageFirstPage) / rowByPage);
      if (pages == 0) { pages = 1;}
      var posX = 0;
      var posY = 0;
      
      doc = new jsPDF("p", "mm", "a4");
	  //POLICE GENERAL DU DOCUMENT
	  doc.setFont("Helvetica");
	   doc.setFontType("bold");
	   
	   //TITRE
	  doc.setFontSize(23);
      doc.text(pixToMm * docWidth/2,pixToMm * heightOffset,document.getElementById('inputTitle').value,'center');
	   
	   //SOUS-TITRE
	  doc.setFontSize(18);
      doc.text(pixToMm * docWidth/2,pixToMm * heightOffset * 2,document.getElementById('inputSubTitle').value,'center');


      var imageIndex = 0;
      var rowOfCurrentPage = 0;
      /// For each page
      for (pageCounter = 0 ; pageCounter < pages ; pageCounter++){
         if (pageCounter == 0){
            rowOfCurrentPage = Math.min(rowByPageFirstPage,row);
            row = row - rowByPageFirstPage;
         }
         else {
            doc.addPage();
            rowOfCurrentPage = Math.min(rowByPage,row);
            row = row - rowByPage;
         }
         // For each row of current page
         for (i = 0; i < rowOfCurrentPage; i++) {
            if (pageCounter == 0) {
               posY = ((i *photoPlusNameHeight)) + heightOffset * 3;
            }
            else {
               posY = ((i * photoPlusNameHeight)) + heightOffset;   
            }
            for (j = 0 ; j < column ; j++){
               if ( imageIndex < loadtotal) 
               {
                  
                  posX = ((((j * 2) + 1) * docWidth / (2 * column)) - canvasList[imageIndex].width / 2);
                  var imgData = canvasList[imageIndex].toDataURL('image/png',1);
                 
                  doc.addImage(imgData,
                              'PNG', 
                              posX * pixToMm,
                              pixToMm* (posY - canvasList[imageIndex].height /2 + photoNameOffset) ,
                              pixToMm*canvasList[imageIndex].width,
                              pixToMm*canvasList[imageIndex].height
                              );
                  var displayedName = "";
                  /// Nom affiché dans le pdf
                  if ( !originalAndFinalAreEquals(galleryUploader.getFile(submittedPhotoList[imageIndex]).name,galleryUploader.getName(submittedPhotoList[imageIndex]))){
                     displayedName = galleryUploader.getName(submittedPhotoList[imageIndex]);
                  }
                  doc.text((posX + canvasList[imageIndex].width/2) * pixToMm,  pixToMm* (posY + pictureHeigth/2 + photoNameOffset) ,displayedName,'center');
                  imageIndex++;
               }  
            }
         }
      }
      }
      
      
      function originalAndFinalAreEquals(orignal,Final){
         
         // get extension of the file
         var extension = qq.getExtension(orignal);
         // Remove extension of the file name
         var originalSansExtension = 
         orignal.replace(new RegExp('.' + extension + '$'), '');
         
         return (Final == originalSansExtension);
      }
   
   
   function drawPhoto(canvas,image,w,h){
      return function() {
      
         var steps = Math.ceil(Math.log(image.width/ w) / Math.log(2));
         
         var factor = w / image.width;
         var resize_h = image.height * factor;
         var min = Math.min(w/2,resize_h);
         
         canvas.width = image.width * factor;
         canvas.height = image.height * factor;
         var interCanvas  = document.createElement('canvas');
         var ctx    = canvas.getContext("2d");
         
         resizeCanvasImage(image, interCanvas, image.width * factor, image.height * factor);

         /// Circular crop part 1
         ctx.save();
         ctx.beginPath();
         ctx.arc(w/2, resize_h/2, min/2, 0, Math.PI*2, true);   
         ctx.closePath();
         ctx.clip();

         /// Rescale with depixelisation
         ctx.drawImage(interCanvas, 0, 0, interCanvas.width, interCanvas.height);

         /// Circular crop part 2
         ctx = canvas.getContext("2d");
         ctx.beginPath();
         ctx.arc(w/2, resize_h/2, min/2, 0, Math.PI*2, true);   
         ctx.clip();
         ctx.closePath();
         ctx.restore();
      }
   }

   /// Create pdf
   function createPDF(){
      addCanvasToPDF();
      doc.save('trombi.pdf');
   }
   
   
   /// Rescale with depixelisation
   function resizeCanvasImage(img, canvas, maxWidth, maxHeight) {
    var imgWidth = img.width, 
        imgHeight = img.height;

    var ratio = 1, ratio1 = 1, ratio2 = 1;
    ratio1 = maxWidth / imgWidth;
    ratio2 = maxHeight / imgHeight;

    // Use the smallest ratio that the image best fit into the maxWidth x maxHeight box.
    if (ratio1 < ratio2) {
        ratio = ratio1;
    }
    else {
        ratio = ratio2;
    }

    var canvasContext = canvas.getContext("2d");
    var canvasCopy = document.createElement("canvas");
    var copyContext = canvasCopy.getContext("2d");
    var canvasCopy2 = document.createElement("canvas");
    var copyContext2 = canvasCopy2.getContext("2d");
    canvasCopy.width = imgWidth;
    canvasCopy.height = imgHeight;  
    copyContext.drawImage(img, 0, 0);

    // init
    canvasCopy2.width = imgWidth;
    canvasCopy2.height = imgHeight;        
    copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);


    var rounds = 2;
    var roundRatio = ratio * rounds;
    for (var i = 1; i <= rounds; i++) {
        console.log("Step: "+i);

        // tmp
        canvasCopy.width = imgWidth * roundRatio / i;
        canvasCopy.height = imgHeight * roundRatio / i;

        copyContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvasCopy.width, canvasCopy.height);

        // copy back
        canvasCopy2.width = imgWidth * roundRatio / i;
        canvasCopy2.height = imgHeight * roundRatio / i;
        copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);

    } // end for


    // copy back to canvas
    canvas.width = imgWidth * roundRatio / rounds;
    canvas.height = imgHeight * roundRatio / rounds;
    canvasContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvas.width, canvas.height);


}




