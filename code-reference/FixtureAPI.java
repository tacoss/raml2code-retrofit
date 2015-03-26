package org.gex.client.v1;
import retrofit.http.*;
import retrofit.client.Response;
import java.util.List;
import java.util.Map;

import rx.Observable;
import retrofit.mime.TypedFile;
import com.pojos.v1.*;


public interface FixtureAPI {

  @GET("/v1/cats")
  /**
   * Use @QueryMap to provide the following optional parameters:
   * searchBy it must be parseable to @String
   */
  Observable<List> getGatitos(
      @QueryMap Map<String, String> options);

  @POST("/v1/cats")
  Observable<ComplexCat> postGatitos(
      @Body ComplexCat complexCat);

  @GET("/v1/cats/{catId}")
  /**
   * Use @QueryMap to provide the following optional parameters:
   * filterBy it must be parseable to @String
   * orderBy it must be parseable to @String
   */
  Observable<ComplexCat> getGatitoById(
      @Path("catId") String catId,
      @Query("clientSecret") String clientSecret,
      @QueryMap Map<String, String> options);

  @PUT("/v1/cats/{catId}")
  Observable<ComplexCat> putGatitoById(
      @Path("catId") String catId,
      @Body ComplexCat complexCat);

  @GET("/v1/cats/{catId}/mapping")
  Observable<ComplexCat> getSingleContentTypeMapping(
      @Path("catId") String catId);

  @POST("/v1/cats/{catId}/picture")
  @Multipart
  Observable<ComplexCat> postGatitoByIdPicture(
      @Path("catId") String catId,
      @Part("file") TypedFile file);

  @POST("/v1/cats/{catId}/webFormCat")
  @FormUrlEncoded
  Observable<ComplexCat> postGatitopByIdForm(
      @Path("catId") String catId,
      @Field("name") String name);

}
