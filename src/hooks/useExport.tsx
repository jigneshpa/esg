// import { useState } from 'react';

// import { useAppDispatch } from '@/store/hooks';
// import { exportFile } from '@/store/slices/export/exportFileSlice';

// import { STATUS } from '../constants';
// import { useAppContext } from '../context/AppContext';

// interface useExportProps {
//   title?: string;
// }

// const useExport = ({ title }: useExportProps) => {
//   const { confirm } = useAppContext();
//   const dispatch = useAppDispatch();
//   const [isDownloading, setLoading] = useState<boolean>(false);
//   //'User Details'
//   //TODO Need to add modals on error and sucess
//   const handleDownload = ({
//     endpoint,
//     sort_by,
//     type = 'csv',
//     selected_id,
//     filter
//   }: {
//     endpoint?: string,
//     sort_by?: any,
//     type?: string,
//     selected_id?: any,
//     filter?: any
//   }) => {
//     confirm({
//       title: title || 'Download report',
//       type: STATUS.DOWNLOAD,
//       onOk: () => handleExportAsset({ endpoint, sort_by, type, selected_id })
//     });
//   };

//   const handleExportAsset = async ({
//     endpoint,
//     roles,
//     country_id,
//     department_Ids,
//     sort_by,
//     type,
//     selected_id,
//     filter
//   }: {
//     roles?: any,
//     country_id?: any,
//     department_Ids?: any,
//     endpoint?: string,
//     sort_by?: any,
//     type?: string,
//     selected_id?: any,
//     filter?: any
//   }) => {
//     try {
//       setLoading(true);
//       await dispatch(
//         exportFile({
//           endpoint,
//           country_id,
//           department_Ids,
//           roles,
//           sort_by,
//           type,
//           userId: selected_id,
//           filter
//         })
//       );
//       setLoading(false);
//     } catch (error) {
//       setLoading(false);
//       console.error('Export error:', error);
//     }
//   };

//   return { handleDownload, handleExportAsset, isDownloading };
// };

// export default useExport;
import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { exportFile } from '@/store/slices/export/exportFileSlice';
import { STATUS } from '../constants';
import { useAppContext } from '../context/AppContext';

// Define props for the hook
interface UseExportProps {
  title?: string;
}

// Define parameters for handleDownload
interface HandleDownloadParams {
  endpoint?: string;
  sort_by?: any;
  type?: string;
  selected_id?: any;
  filter?: any;
}

// Define parameters for handleExportAsset with companyIds
interface HandleExportAssetParams {
  endpoint?: string;
  sort_by?: any;
  type?: string;
  selected_id?: any;
  filter?: any;
  roles?: any;
  country_id?: any;
  department_Ids?: any;
  companyIds?: number[] | null; // Add companyIds here
}

const useExport = ({ title }: UseExportProps) => {
  const { confirm } = useAppContext();
  const dispatch = useAppDispatch();
  const [isDownloading, setLoading] = useState<boolean>(false);

  const handleDownload = ({
    endpoint,
    sort_by,
    type = 'csv',
    selected_id,
    filter
  }: HandleDownloadParams) => {
    confirm({
      title: title || 'Download report',
      type: STATUS.DOWNLOAD,
      onOk: () => handleExportAsset({ endpoint, sort_by, type, selected_id })
    });
  };

  const handleExportAsset = async ({
    endpoint,
    roles,
    country_id,
    department_Ids,
    sort_by,
    type,
    selected_id,
    filter,
    companyIds // Destructure companyIds
  }: HandleExportAssetParams) => {
    try {
      setLoading(true);
      await dispatch(
        exportFile({
          endpoint,
          country_id,
          department_Ids,
          roles,
          sort_by,
          type,
          userId: selected_id,
          filter,
          companyIds // Pass companyIds to the exportFile action
        })
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Export error:', error);
    }
  };

  return { handleDownload, handleExportAsset, isDownloading };
};

export default useExport;