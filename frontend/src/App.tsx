import { useState } from 'react';
import { Toaster, toast } from 'sonner'
import { uploadFile } from './services/upload';
import { Data } from './types';
import { Search } from './features/Search';

const APP_STATUS = {
  IDLE: 'idle', // al entrar
  ERROR: 'error', // cuando hay un error
  READY_UPLOAD: 'ready-upload', // luego de elegir archivo, antes de subir
  UPLOADING: 'uploading', // luego de apretar botón upload, mientras se sube
  READY_USAGE: 'ready-usage', // después de subir archivo
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: 'Upload File',
  [APP_STATUS.UPLOADING]: 'Uploading ... ',
};

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);

  const [file, setFile] = useState<File | null>(null);

  const [data, setData] = useState<Data>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = e.target.files ?? [];
    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD);
      console.log(file);
    }
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) { return }  
    setAppStatus(APP_STATUS.UPLOADING);
    const [err, newData] = await uploadFile(file)
    if (err) {
      setAppStatus(APP_STATUS.ERROR)
      toast.error(err.message)
      return
    }
    if(newData) setData(newData)
    setAppStatus(APP_STATUS.READY_USAGE)
    toast.success("File uploaded correctly")
    console.log('newData', newData)
  };

  const showButton =
    appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;

  const showInput = appStatus !== APP_STATUS.READY_USAGE

  const showSearch = appStatus === APP_STATUS.READY_USAGE

  return (
    <>
      <main>
        <Toaster />
        <h1 className='title'>CSV Data Visualizer</h1>
        {showInput && (
          <form onSubmit={handleSubmit}>
            <label htmlFor='file'>
              <input
                disabled={appStatus === APP_STATUS.UPLOADING}
                type='file'
                name='file'
                accept='.csv'
                id='file'
                onChange={handleInputChange}
              />
            </label>
            {showButton && (
              <button disabled={appStatus === APP_STATUS.UPLOADING}>
                {BUTTON_TEXT[appStatus]}
              </button>
            )}
          </form>
        )}
        {showSearch && (
          <Search initialData={data}/>
        )}
      </main>
    </>
  );
}

export default App;

