/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import React from 'react';
import useGraphQL from '../api/useGraphQL';
import { Link } from 'react-router-dom';
import Error from './base/Error';
import Loading from './base/Loading';
import "./Articles.scss";
import { mapJsonRichText } from '../utils/renderRichText';
import { getImageURL } from "../utils/fetchData";
import { getQueryStringForHashRouting } from "../utils/commons";

//https://publish-p9606-e71941.adobeaemcloud.com/adobe/contentFragments/generic_template/8452c7ac-e9f3-4a81-9345-3689afc2ac3d/main.html

const Article = ({ _path, title, synopsis, authorFragment, slug }) => {
  const editorProps = {
    "data-aue-resource": "urn:aemconnection:" + _path + "/jcr:content/data/master",
    "data-aue-type": "reference",
    "data-aue-filter": "cf"
  };
  return (
    <li className="article-item" {...editorProps}>
      <aside>
        <img className="article-item-image"
          src={`${getImageURL(authorFragment?.profilePicture)}`}
          alt={title} data-aue-prop="profilePicture" data-aue-type="media" />
      </aside>
      <article>
        <Link to={`/articles/article/${slug}${getQueryStringForHashRouting()}`}>
          <h3 data-id="title" data-aue-prop="title" data-aue-type="text">{title}</h3>
        </Link>

        <p>{`By ${authorFragment.firstName} ${authorFragment.lastName}`}</p>
        {synopsis &&
          <div className="article-content" data-aue-prop='synopsis' data-aue-type='richtext'>
            {mapJsonRichText(synopsis.json)}
          </div>
        }
        <Link to={`/articles/article/${slug}${getQueryStringForHashRouting()}`}>
          <button>Read more</button>
        </Link>
      </article>

    </li>
  );
};

const Articles = () => {
  const persistentQuery = 'wknd-shared/articles-all';
  const formHeadingQuery = 'wknd-shared/form-heading-by-path;path=/content/dam/wknd-shared/form-heading';
  const formHeadingResource = "urn:aemconnection:/content/dam/wknd-shared/form-heading/jcr:content/data/master";

  //Use a custom React Hook to execute the GraphQL query
  const { data, errorMessage } = useGraphQL(persistentQuery);
  const { data: formHeadingData } = useGraphQL(formHeadingQuery);

  const formHeading = formHeadingData?.storeContentFragmentModelByPath?.item ||
    formHeadingData?.storeContentFragmentModelList?.items?.[0] ||
    formHeadingData?.formHeadingByPath?.item ||
    formHeadingData?.formHeadingList?.items?.[0] ||
    { storeName: 'Articles', storeDescription: null };

  //If there is an error with the GraphQL query
  if (errorMessage) return <Error errorMessage={errorMessage} />;

  //If data is null then return a loading state...
  if (!data) return <Loading />;

  return (
    <section className="articles">
      <div>
        <h2
          data-aue-resource={formHeadingResource}
          data-aue-type="text"
          data-aue-prop="storeName"
          data-aue-filter="cf"
        >
          {formHeading.storeName}
        </h2>
        {formHeading.storeDescription?.json && (
          <div
            data-aue-resource={formHeadingResource}
            data-aue-prop="storeDescription"
            data-aue-type="richtext"
            data-aue-filter="cf"
          >
            {mapJsonRichText(formHeading.storeDescription.json)}
          </div>
        )}
      </div>
      <ul>
        {
          data.articleList.items.map((article, index) => {
            return (
              <Article key={index} {...article} />
            );
          })
        }
      </ul>
    </section>
  );

};

export default Articles;





