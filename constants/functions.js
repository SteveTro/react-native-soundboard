import RNFetchBlob from 'rn-fetch-blob';
import secure from './secure';
import AsyncStorage from '@react-native-community/async-storage';
import constants from './constants';

const functions = {
  updateApp: async function (newSounds, setupdating, updating) {
    return new Promise(async (resolve, reject) => {
      let dD = RNFetchBlob.fs.dirs.DocumentDir;

      setupdating({...updating, message: 'Downloading new sounds ...'});
      var filePath = `${dD}/fileList.json`;
      var result = null;
      try {
        result = await RNFetchBlob.fs.exists(filePath);
        if (result) {
          result = await RNFetchBlob.fs.readFile(filePath);
          result = JSON.parse(result);
        } else {
          result = {
            lastUpdated: Date.now(),
            sounds: [],
          };
          RNFetchBlob.fs.createFile(filePath, JSON.stringify(result));
        }
      } catch (error) {
        console.log(error);
      }

      var {sounds} = result;
      var downloadArray = newSounds;
      var deleteArray = sounds;

      if (result && sounds) {
        downloadArray = newSounds.filter((i) => {
          if (sounds.findIndex((s) => s.key === i.key) == -1) return true;
        });

        deleteArray = sounds.filter((i) => {
          if (newSounds.findIndex((n) => n.key == i.key) == -1) return true;
        });
      }

      var downloadProm = downloadArray.map(async (item, index) => {
        let url = `${secure.api}/sounds/${item.path}`;
        let file = await RNFetchBlob.config({
          fileCache: true,
          path: `${dD}/${item.path}`,
        }).fetch('GET', url, {
          Authorization: secure.bearer,
        });
        var path = await file.path();
        setupdating({
          ...updating,
          message: `Download file ${index + 1} of  ${downloadProm.length}`,
        });
        return path;
      });

      setupdating({
        ...updating,
        message: 'Download file 1 of ' + downloadProm.length,
      });

      await Promise.all(downloadProm).catch((error) => console.log(error));

      var deleteProm = deleteArray.map(async (item, i) => {
        return await RNFetchBlob.fs.unlink(`${dD}/${item.path}`);
      });

      await Promise.all(deleteProm);

      let file = await RNFetchBlob.config({
        fileCache: true,
        path: `${dD}/fileList.json`,
      }).fetch('GET', `${secure.api}/overview.json`, {
        Authorization: secure.bearer,
      });
      console.log(await file.path());
      await AsyncStorage.setItem(constants.lastUpdated, Date.now().toString());
      resolve();
    });
  },
};

export default functions;
