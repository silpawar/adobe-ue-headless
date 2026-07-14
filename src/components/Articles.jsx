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
  const caravanQuery = 'wknd-shared/caravanContentByPath;path=/content/dam/wknd-shared/caravan-content';
  const formHeadingResource = "urn:aemconnection:/content/dam/wknd-shared/form-heading/jcr:content/data/master";
  const caravanResource = "urn:aemconnection:/content/dam/wknd-shared/caravan-content/jcr:content/data/master";
  const [activeStep, setActiveStep] = React.useState(1);

  const isUniversalEditor = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  //Use a custom React Hook to execute the GraphQL query
  const { data, errorMessage } = useGraphQL(persistentQuery);
  const { data: formHeadingData } = useGraphQL(formHeadingQuery);
  const { data: caravanData, errorMessage: caravanErrorMessage } = useGraphQL(caravanQuery);

  const formHeading = formHeadingData?.storeContentFragmentModelByPath?.item ||
    formHeadingData?.storeContentFragmentModelList?.items?.[0] ||
    formHeadingData?.formHeadingByPath?.item ||
    formHeadingData?.formHeadingList?.items?.[0] ||
    { storeName: 'Articles', storeDescription: null };

  const caravanContent = caravanData?.caravanformmodelByPath?.item || {
    step1heading: 'Let\'s find your caravan',
    step1cta: 'Continue to step 2',
    step2heading: 'Let\'s find your caravan - confirm',
    step2cta: 'Continue to step 3',
    step3heading: 'Let\'s set up the basics',
    step3cta: 'Finish',
    finalstepmessage: null
  };

  const steps = [
    { id: 1, headingProp: 'step1heading', ctaProp: 'step1cta', heading: caravanContent.step1heading, cta: caravanContent.step1cta },
    { id: 2, headingProp: 'step2heading', ctaProp: 'step2cta', heading: caravanContent.step2heading, cta: caravanContent.step2cta },
    { id: 3, headingProp: 'step3heading', ctaProp: 'step3cta', heading: caravanContent.step3heading, cta: caravanContent.step3cta }
  ];

  //If there is an error with the GraphQL query
  if (errorMessage || caravanErrorMessage) return <Error errorMessage={errorMessage || caravanErrorMessage} />;

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

      <div className="caravan-form-steps">
        {steps.map((step) => {
          const isVisible = isUniversalEditor || activeStep === step.id;
          return isVisible ? (
            <div key={step.id} className="caravan-form-step" data-step={step.id}>
              <h3
                data-aue-resource={caravanResource}
                data-aue-type="text"
                data-aue-prop={step.headingProp}
                data-aue-filter="cf"
              >
                {step.heading}
              </h3>
              <button
                type="button"
                data-aue-resource={caravanResource}
                data-aue-type="text"
                data-aue-prop={step.ctaProp}
                data-aue-filter="cf"
                onClick={() => setActiveStep((current) => Math.min(current + 1, 4))}
              >
                {step.cta}
              </button>
            </div>
          ) : null;
        })}

        {(isUniversalEditor || activeStep === 4) && (
          <div className="caravan-form-step caravan-form-success" data-step="success">
            {caravanContent.finalstepmessage?.[0]?.json ? (
              <div
                data-aue-resource={caravanResource}
                data-aue-prop="finalstepmessage"
                data-aue-type="richtext"
                data-aue-filter="cf"
              >
                {mapJsonRichText(caravanContent.finalstepmessage[0].json)}
              </div>
            ) : (
              <div
                data-aue-resource={caravanResource}
                data-aue-prop="finalstepmessage"
                data-aue-type="richtext"
                data-aue-filter="cf"
              >
                Congratulations! You have done it!
              </div>
            )}
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





