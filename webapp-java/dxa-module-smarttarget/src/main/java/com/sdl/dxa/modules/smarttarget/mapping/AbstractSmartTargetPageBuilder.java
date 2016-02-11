package com.sdl.dxa.modules.smarttarget.mapping;

import com.sdl.dxa.modules.smarttarget.model.entity.smarttarget.SmartTargetPageModel;
import com.sdl.dxa.modules.smarttarget.model.entity.smarttarget.SmartTargetRegion;
import com.sdl.webapp.common.api.content.ContentProvider;
import com.sdl.webapp.common.api.content.ContentProviderException;
import com.sdl.webapp.common.api.localization.Localization;
import com.sdl.webapp.common.api.model.PageModel;
import com.sdl.webapp.common.api.model.mvcdata.MvcDataCreator;
import com.sdl.webapp.tridion.mapping.PageBuilder;
import com.sdl.webapp.util.dd4t.FieldUtils;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.dd4t.contentmodel.Field;
import org.dd4t.contentmodel.FieldSet;
import org.dd4t.contentmodel.Page;
import org.dd4t.contentmodel.PageTemplate;

import java.util.List;
import java.util.Map;

import static com.google.common.base.Strings.isNullOrEmpty;

@Slf4j
/**
 * <p>Abstract AbstractSmartTargetPageBuilder class with common codebase for all versions of module.</p>
 */
public abstract class AbstractSmartTargetPageBuilder implements PageBuilder {

    private static final String PROMOTION_VIEW_NAME_CONFIG = "smarttarget.smartTargetEntityPromotion";

    private static String getViewNameFromMetadata(Map<String, Field> metadata) {
        String regionName = FieldUtils.getStringValue(metadata.get("name"));
        if (isNullOrEmpty(regionName)) {
            regionName = MvcDataCreator.creator()
                    .fromQualifiedName(FieldUtils.getStringValue(metadata.get("view")))
                    .create()
                    .getViewName();
        }
        return regionName;
    }

    private static void processMetadataForCurrentRegionModel(Map<String, Field> metadata, SmartTargetRegion regionModel) {
        regionModel.setMaxItems(100);
        if (metadata.containsKey("maxItems")) {
            String value = FieldUtils.getStringValue(metadata.get("maxItems"));
            if (value != null) {
                regionModel.setMaxItems(Integer.parseInt(value));
            }
        }
    }

    private static String getPromotionViewName(Localization localization) {
        String promotionViewName = localization.getConfiguration(PROMOTION_VIEW_NAME_CONFIG);
        if (isNullOrEmpty(promotionViewName)) {
            log.warn("No view name for SmartTarget promotions is configured in CM, {}", PROMOTION_VIEW_NAME_CONFIG);
            promotionViewName = "SmartTarget:Entity:Promotion";
        }
        return promotionViewName;
    }

    private static boolean getAllowDuplicatesFromConfig(PageTemplate pageTemplate, @NonNull Localization localization) {
        String allowDuplicationOnSamePage = null;
        if (pageTemplate != null && pageTemplate.getMetadata() != null
                && pageTemplate.getMetadata().containsKey("allowDuplicationOnSamePage")) {
            allowDuplicationOnSamePage = FieldUtils.getStringValue(pageTemplate.getMetadata().get("allowDuplicationOnSamePage"));
        }

        if (isNullOrEmpty(allowDuplicationOnSamePage) || allowDuplicationOnSamePage.equalsIgnoreCase("Use core configuration")) {
            allowDuplicationOnSamePage = localization.getConfiguration("smarttarget.allowDuplicationOnSamePageConfig");

            if (isNullOrEmpty(allowDuplicationOnSamePage)) {
                return true;
            }
        }

        return Boolean.parseBoolean(allowDuplicationOnSamePage);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public int getOrder() {
        return 1000;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public PageModel createPage(Page page, PageModel pageModel, Localization localization, ContentProvider contentProvider)
            throws ContentProviderException {

        if (pageModel == null || !pageModel.getRegions().containsClass(SmartTargetRegion.class)) {
            log.debug("There are no SmartTargetRegions on the page {}", pageModel);
            return pageModel;
        }

        if (page == null || page.getPageTemplate() == null ||
                page.getPageTemplate().getMetadata() == null || !page.getPageTemplate().getMetadata().containsKey("regions")) {
            log.debug("No regions metadata found in {}", page);
            return pageModel;
        }

        SmartTargetPageModel stPageModel = new SmartTargetPageModel(pageModel).setAllowDuplicates(
                getAllowDuplicatesFromConfig(page.getPageTemplate(), localization));

        List<Object> regions = page.getPageTemplate().getMetadata().get("regions").getValues();
        for (Object region : regions) {
            if (!(region instanceof FieldSet)) {
                log.error("Expected Metadata Region to be a {} but is a {}", FieldSet.class, region.getClass());
                throw new ContentProviderException("Cannot read metadata for a region");
            }

            Map<String, Field> metadata = ((FieldSet) region).getContent();

            String regionName = getViewNameFromMetadata(metadata);
            if (!stPageModel.containsRegion(regionName)) {
                log.debug("Page model does not contain a region {}", regionName);
                return stPageModel;
            }

            if (!(stPageModel.getRegions().get(regionName) instanceof SmartTargetRegion)) {
                continue;
            }

            processMetadataForCurrentRegionModel(metadata, (SmartTargetRegion) stPageModel.getRegions().get(regionName));

            String promotionViewName = getPromotionViewName(localization);
            log.debug("Using promotion view name {}", promotionViewName);

            processQueryAndPromotions(localization, stPageModel, promotionViewName);
        }

        return stPageModel;
    }

    /**
     * <p>processQueryAndPromotions.</p>
     *
     * @param localization      a {@link com.sdl.webapp.common.api.localization.Localization} object.
     * @param stPageModel       a {@link SmartTargetPageModel} object.
     * @param promotionViewName a {@link java.lang.String} object.
     */
    protected abstract void processQueryAndPromotions(Localization localization, SmartTargetPageModel stPageModel, String promotionViewName);
}
