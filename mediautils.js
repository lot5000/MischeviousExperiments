var currentUrlFile;
var currentPictureUrl;
var currentPicturePath;
var teasePath;
var personalityPath;
var separator = java.io.File.separator;

/**
* setUpMedia method will set up this util class. Call this at the beginning of the personality.
**/
function setUpMedia() {
    var TeaseAI = Java.type("me.goddragon.teaseai.TeaseAI");
    var file = new java.io.File(TeaseAI.class.getProtectionDomain().getCodeSource().getLocation().toURI());
    //The path to the main directory
    teasePath = file.getParent();
    DMessage(teasePath);
    var file2 = TeaseAI.application.getSession().getActivePersonality().getFolder();
    //The path to your personality directory
    personalityPath = file2.getAbsolutePath();
}

/**
* getAppPath method will return the directory path to the base directory of the app
**/
function getAppPath() {
    return teasePath + separator;
}
/**
* showTaggedImage method will show and return a random picture of the given type (2, 3 ,4 (normal, liked, loved)) with
* the tags provided as an array
**/
function showTaggedImage(imageType, imageTags, delay) {
    //TODO add functionality for what if there isnt an image with all of the tags but there is one with all but one...?
    var localpath = "";
    switch (imageType) {
        case 2:
        case "normal":
            localpath = "images" + separator + "normal";
            break;
        case 3:
        case "liked":
            localpath = "images" + separator + "liked";
            break;
        case 4:
        case "loved":
            localpath = "images" + separator + "loved";
            break;
        default:
            localpath = "images" + separator + "normal";
    }
    var path = teasePath + separator + localpath;
    var pictureHandler = Java.type("me.goddragon.teaseai.api.picture.PictureHandler");
    var matchingImages = pictureHandler.getHandler().getTaggedPicturesExact(new java.io.File(path), imageTags);
    //DMessage(matchingImages.toString());
    if (matchingImages == null)
    {
        return null;
    }
    var randomImage = matchingImages.get(randomInteger(0, matchingImages.length - 1));

    var toReturn = showImage(randomImage.getFile().getPath());
    if (delay != null)
    {
        sleep(delay);
    }
    return toReturn;
        
}
function sortPicture(file, sortPlace=2)
{
    var taggedPicture = Java.type("me.goddragon.teaseai.api.picture.TaggedPicture");
    DMessage("Moving file" + file, 0);
    var myFile;
    var taggedFile;
    if (file instanceof java.io.File) {
        myFile = file;
        taggedFile = new taggedPicture(myFile);
    }
    else if (file.search(teasePath) != -1) {
        myFile = new java.io.File(file);
        taggedFile = new taggedPicture(myFile);
    }
    else if (file instanceof taggedPicture)
    {
        taggedFile = file;
    }
    else {
        myFile = new java.io.File(teasePath + separator + file);
        taggedFile = new taggedPicture(myFile);
    }
    var localpath = "";
    switch (sortPlace) {
        case 1:
        case "dislike":
            localpath = "delete";
            break;
        case 2:
        case "normal":
            localpath = "images" + separator + "normal" + separator;
            break;
        case 3:
        case "liked":
            localpath = "images" + separator + "liked" + separator;
            break;
        case 4:
        case "loved":
            localpath = "images" + separator + "loved" + separator;
            break;
        default:
            localpath = null;
    }
    if (localpath == null)
    {
        EMessage("sortPicture called with invalid args!");
    }
    else if (localpath == "delete")
    {
        myFile.delete();
        return true;
    }
    else
    {
        return taggedFile.move(getAppPath() + localpath + myFile.getName());
    }
    return false;
}

function loadUrlImages(amount, urlfilename, removed) {
    //returns mediaurl type
    var taggedPicture = Java.type("me.goddragon.teaseai.api.picture.TaggedPicture");
    var urlfile;
    if (urlfilename == null)
    {
        urlfile = createMediaURL("../../Images/System/URL Files/*.txt");
        while (!(urlfile.isUseForTease()))
        {
            urlfile = createMediaURL("../../Images/System/URL Files/*.txt");
        }
    }
    else
    {
        urlfile = createMediaURL("../../Images/System/URL Files/" + urlfilename);
    }
    if (removed)
    {
        DMessage("currentUrlFile: " + urlfile);
        var mediaUrls = urlfile.getMediaURLs();
        var deleteFile = false;
        var duplicates = 0;
        if (mediaUrls.length < amount)
        {
            amount = mediaUrls.length;
            deleteFile = true;
        }
        for (var i = 0; i < amount; i++)
        {
            var myfile = getFileFromUrl(mediaUrls[i]);
            var taggedFile = new taggedPicture(myfile);
            if (taggedFile.isDuplicate())
            {
                myfile.delete();
                i--;
                duplicates++;
            }
        }
        mediaUrls.subList(0, (amount + duplicates + 1)).clear();
        urlfile.saveToFile();
    }
    else
    {
        var consecutiveDuplicates = 0;
        var mediaUrls = urlfile.getMediaURLs();
        for (var i = 0; i < amount; i++)
        {
            var image = getFileFromUrl(mediaUrls[randomInteger(0, mediaUrls.length - 1)]);
            var taggedFile = new taggedPicture(image);
            if (taggedFile.isDuplicate())
            {
                consecutiveDuplicates++;
                image.delete();
                i--;
            }
            else
            {
                consecutiveDuplicates = 0;
            }
            if (consecutiveDuplicates >= 30)
            {
                WMessage("This file does not have enough images for the amount requested", 0);
                break;
            }
        }
    }
    return 1;
}
/**
* getTeasePicture method will show and return a random picture from one of the category files. Use 1 for tumblr images, 2 for normal images, 3 for liked images, 4 for loved images
**/
function getTeasePicture(flag=1, time)
{
    var tumblrimages = listFilesInFolder("images" + separator + "system" + separator + "tumblr" + separator);
    if (tumblrimages.length < 20)
    {
        DMessage("loading images");
        loadUrlImages(100 - tumblrimages.length, null, true);
    }
    var path = "images" + separator + "system" + separator + "tumblr" + separator;
    switch(flag)
    {
        case 1:
            path = "images" + separator + "system" + separator + "tumblr" + separator;
            break;
        case "normal":
        case 2:
            path = "images" + separator + "normal" + separator;
            break;
        case "liked":
        case 3:
            path = "images" + separator + "liked" + separator;
            break;
        case "loved":
        case 4:
            path = "images" + separator + "loved" + separator;
            break;
    }
    var directoryFiles = listFilesInFolder(path);
    var jFile = directoryFiles[randomInteger(0, directoryFiles.length - 1)];

    var extension = "";
    var i = jFile.getName().lastIndexOf('.');
    if (i > 0) {
        extension = jFile.getName().substring(i+1);
    }
    var consecutiveNotPic = 0;
    while (jFile.isDirectory() || (extension != "png" && extension != "jpg" && extension != "gif"))
    {
        var r = randomInteger(0, directoryFiles.length - 1);
        jFile = directoryFiles[r];
        consecutiveNotPic++;
        if (consecutiveNotPic >= 30)
        {
            WMessage(path + " directory is empty!");
            return null;
        }
        extension = "";
        i = jFile.getName().lastIndexOf('.');
        if (i > 0) {
            extension = jFile.getName().substring(i+1);
        }
    }
    currentPicturePath = jFile.getPath().replace(teasePath, "");
    var toReturn = showImage(jFile);
    if (time != null)
    {
        sleep(time);
    }
    return toReturn;
}

/**
* getImageUrl method will return the url of the current displayed image
**/
function getImageUrl() {
    return currentPictureUrl;
}

function getLocalTeasePicture(path, name) {
    const image = showImage(path + separator + name);
    //showImage("Images/Liked/tumblr_oah6x4ffKZ1v0oj9oo1_1280.jpg");
    //sendMessage("testmsg " + image, 0);
    if (image != null) {
        currentPicturePath = image;
        currentPictureUrl = null;
        currentUrlFile = null;
    }
    return image;
}
/**
* getImagePath method will return the path of the displayed image
**/
function getImagePath() {
    return currentPicturePath;
}
/**
* getCurrentUrlFile method will return the file the current url is displayed from
**/
function getCurrentUrlFile() {
    return currentUrlFile;
}

/**
* getOrCreateFile helper method will return the java file from the path or create it if it doesnt exist
**/
function getOrCreateFile(path) {
    var myFile = new java.io.File(path);
	new java.io.File(myFile.getParent()).mkdirs();
    myFile.createNewFile();
    return myFile;
}

/**
* listFilesInFolder method that will return all files in a folder. Pass in either a path or a java file.
**/
function listFilesInFolder(folder) {
    var folderFile;
    if (folder instanceof java.io.File) {
        folderFile = folder;
    }
    else if (folder.search("C:") != -1 || folder.search("Users") != -1) {
        folderFile = new java.io.File(folder);
    }
    else {
        folderFile = new java.io.File(personalityPath + separator + folder);
    }
    DMessage(folderFile.getPath());
    if (!folderFile.exists())
    {
        folderFile = new java.io.File(teasePath + separator + folder);
        if (!folderFile.exists())
        {
            EMessage("File does not exist " + folderFile.getPath());
        }
    }
    if (!folderFile.isDirectory())
    {
        EMessage("File is not a directory " + folderFile.getPath());
    }
    return folderFile.listFiles();
}
function getFileFromUrl(url)
{
    var split = url.split("/");
    var path = split[split.length - 1];
    path = teasePath + separator + "images" + separator + "system" + separator + "tumblr" + separator + path;
    var file = new java.io.File(path);
    if (file.exists())
    {
        return file;
    }
    try{
        var inputstream = new java.io.BufferedInputStream(new java.net.URL(url).openStream());
        var out = new java.io.ByteArrayOutputStream();
        var buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
        var n;
        while (-1 != (n = inputstream.read(buf)))
        {
            out.write(buf, 0 , n);
        }
        out.close();
        inputstream.close();
        var response  = out.toByteArray();
        var fos = new java.io.FileOutputStream(path);
        fos.write(response);
        fos.close();

    }catch(e)
    {
        EMessage(e.message);
        return null
    }
    if (file.exists())
    {
        return file;
    }
    return null;
}

    //lowest inclusive to highest inclusive
function randomInteger(lowest, highest) {
    return Math.floor(Math.random() * (highest - lowest + 1)) + lowest;
}