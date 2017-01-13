package com.sdl.delivery.ish.webapp.module.controller;

import com.sdl.delivery.ish.webapp.module.localization.DitaLocalization;
import com.sdl.delivery.ish.webapp.module.providers.DitaContentProvider;
import com.sdl.webapp.common.api.WebRequestContext;
import com.sdl.webapp.common.api.content.ContentProviderException;
import com.sdl.webapp.common.api.content.StaticContentItem;
import com.sdl.webapp.common.api.formats.DataFormatter;
import com.sdl.webapp.common.api.model.PageModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Controller for Dita Module.
 */
@Slf4j
@Controller
public class DitaController {

    @Autowired
    private WebRequestContext webRequestContext;

    @Autowired
    private DitaContentProvider contentProvider;

    @Autowired
    private DataFormatter dataFormatters;

    /**
     * Get page model using the json format.
     *
     * @param request
     * @return Page model using the json format.
     */
    @RequestMapping(method = GET, value = "/api/page/{publicationId}/{pageId}/**",
            produces = {MediaType.APPLICATION_JSON_VALUE})
    public ModelAndView getPage(@PathVariable String publicationId,
                                @PathVariable String pageId,
                                final HttpServletRequest request) throws ContentProviderException {
        final DitaLocalization localization = (DitaLocalization) webRequestContext.getLocalization();
        localization.setPublicationId(publicationId);
        final PageModel page;
        page = contentProvider.getPageModel(pageId, localization);
        return dataFormatters.view(page);
    }

    @RequestMapping(method = GET, value = "/binary/{publicationId}/{binaryId}/**")
    @ResponseBody
    public ResponseEntity<InputStreamResource> getBinaryResource(@PathVariable Integer publicationId,
                                                                 @PathVariable Integer binaryId)
            throws ContentProviderException, IOException {
        StaticContentItem binaryItem = contentProvider.getBinaryContent(publicationId, binaryId);
        InputStreamResource result = new InputStreamResource(binaryItem.getContent());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(binaryItem.getContentType()));
        headers.setContentLength(binaryItem.getContent().available());

        return new ResponseEntity<InputStreamResource>(result, headers, HttpStatus.OK);
    }
}
