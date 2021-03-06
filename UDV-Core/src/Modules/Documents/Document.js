/**
* Constructor for Document
* Currently, a document is an image with associated metadata (doc_ID, title, date, + other metadata...)
* + associated viewPosition & viewQuaternion (used by focusOnDoc() to orient the camera
* + associated billboard (optional)
*/
//=============================================================================
export function Document(docTitle,docIndex,doc_ID,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,docDate,metaData) {

    // unique ID for the doc, determined by the line in the doc csv file
    // must be a consecutive list of index (0,1,2,3,4 etc)
    // used internally by GuidedTourController and DocumentHandler
    this.index = docIndex;

    // another unique ID, used by historians to indentify documents
    // cannot be directly used internally, because the doc_ID list is not consecutive (gaps)
    // not used in the code, only displayed
    this.doc_ID = doc_ID;

    // path to the image (High Def & Bad Def)
    this.imageSourceHD = docImageSourceHD;
    this.imageSourceBD = docImageSourceBD;

    // other metadata (currently just a text)
    this.metaData = metaData;

    // date used by TemporalController : the date will become this date when the doc is focused
    this.startDate = docDate;

    this.title = docTitle;

    // if false, no billboard will be created or displayed for this docTitle
    // will be set to true if valid data is provided in the csv file
    this.useBillboard = (!isNaN(billboardPosition.x) && !isNaN(billboardPosition.y) && !isNaN(billboardPosition.z));

    // world position of the billboard (where it will be)
    this.billboardPosition = billboardPosition;

    // position & orientation of the camera when the doc is focused
    // must be determined by hand in order to align the doc image with the 3d scene
    this.viewPosition = docViewPosition;
    this.viewQuaternion = docViewQuaternion;

    // plane with the image
    this.billboardGeometry = null;
    // plane with wireframe (better visibility for the billboard)
    this.billboardGeometryFrame = null;

    // user data that will be given to the billboard object
    this.docBillboardData = null;

    // billboard geometry creation, only called if useBillboard is true
    // billboards are made of billboardGeometry (a plane with the image)
    // and billboardGeometryFrame which is only a wireframe to better see the billboard
    // this is very dirty :-o
    this.createBillboard = function createBillboard(){

        const texture = new THREE.TextureLoader().setCrossOrigin("anonymous").load(docImageSourceBD);
        const billboardMaterial = new THREE.MeshBasicMaterial({map: texture});
        const frameMaterial = new THREE.MeshBasicMaterial( {color: 0x00ffaa,wireframe: true});

        this.billboardGeometry = new THREE.Mesh( new THREE.PlaneGeometry( 80, 50, 1 , 1), billboardMaterial );
        this.billboardGeometryFrame =  new THREE.Mesh(new THREE.PlaneGeometry( 80, 50, 1 , 1), frameMaterial );

        // set billboards to the same layers as other buildings (controls will bug if not)
        this.billboardGeometry.layers.set(1);
        this.billboardGeometryFrame.layers.set(1);

        this.billboardGeometry.position.copy(billboardPosition);
        this.billboardGeometryFrame.position.copy(billboardPosition);
        this.billboardGeometry.updateMatrixWorld();
        this.billboardGeometryFrame.updateMatrixWorld();

        // these data can be accessed when the user click on the billboard
        // --type : "billboard"-- is used to identify when we click on a billboard
        // --doc : this-- is a reference the actual document object, which holds all the relevant data
        // other lines are mostly useless
        this.docBillboardData = {
            type : "billboard",
            doc : this,
        };

        // the data is added to the THREE.js object3D : https://threejs.org/docs/#api/core/Object3D
        this.billboardGeometry.userData = this.docBillboardData;
    }

    if(this.useBillboard){
        this.createBillboard();
    }
}
