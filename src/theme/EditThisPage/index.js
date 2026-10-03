import React from 'react';
import Link from '@docusaurus/Link';
import IconEdit from '@theme/Icon/Edit';

export default function EditThisPage({editUrl}) {
  return (
    <Link to={editUrl} className="theme-edit-this-page">
      <IconEdit />
      Suggest a correction
    </Link>
  );
}
