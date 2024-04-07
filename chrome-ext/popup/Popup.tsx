import '@pages/popup/Popup.css';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import MainScreen from './screens';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  return (
    <div className={`App flex flex-col h-full overflow-auto ${theme === 'light' ? 'light' : 'dark'}`}>
      <MainScreen />
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
