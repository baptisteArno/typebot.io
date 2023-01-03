import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: calc(370px - 30px);
  border: 1px solid #9e9e9e;
  border-radius: 10px;
  padding: 5px;
  overflow-x: hidden;

  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: transparent;
  }

  &::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #9e9e9e;
  }
`;

export const ListProducts = styled.div`
    padding: 5px 15px;
    overflow-x: hidden;
    overflow-y: auto;
    height: calc(350px - 30px);

    &::-webkit-scrollbar-track {
      border-radius: 10px;
      background-color: transparent;
    }

    &::-webkit-scrollbar {
      width: 5px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: #9e9e9e;
    }
`;

export const Instructions = styled.div`
  font-size: .8rem;
  font-family: 'Noto Sans',sans-serif;
`;

export const ProductItem = styled.div`
    width: 100%;
    padding: 15px;
    height: 100px;
    margin-bottom: 15px;
    border: 1px solid #e0e0e0;
    display: flex;
    flex-direction: row;
    align-items: center;

    &:hover{
      background-color: #f9f9f9;
    }
`;


export const ProductContainer = styled.div`
    width: 80%;
    position: relative;
    display: flex;
    flex-direction: column;
`;

export const ImageProduct = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 10px 0 0;
    img{
      width: 100%;
    }
`;

export const TitleProduct = styled.div`
    width: 250px;
    font-size: .8rem;
    font-weight: 700;
    font-family: 'Noto Sans',sans-serif;
`;

export const Price = styled.div`
    width: 80%;
    font-size: .8rem;
    color: #333;

    del{
      color: #929292;
    }
`;

export const Destination = styled.div`
    width: 20%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;

    input[type=checkbox] {
      position: relative;
      border: 2px solid #000;
      border-radius: 2px;
      background: none;
      cursor: pointer;
      line-height: 0;
      margin: 0 .6em 0 0;
      outline: 0;
      padding: 0 !important;
      vertical-align: text-top;
      height: 20px;
      width: 20px;
      -webkit-appearance: none;
      opacity: .5;
    }
    
    input[type=checkbox]:hover {
      opacity: 1;
    }
    
    input[type=checkbox]:checked {
      background-color: #000;
      opacity: 1;
    }
    
    input[type=checkbox]:before {
      content: '';
      position: absolute;
      right: 50%;
      top: 50%;
      width: 4px;
      height: 10px;
      border: solid #FFF;
      border-width: 0 2px 2px 0;
      margin: -1px -1px 0 -1px;
      transform: rotate(45deg) translate(-50%, -50%);
      z-index: 2;
    }
`;

export const CustomVariation = styled.button`
    background: none;
    border: none;
`;

export const ContainerVariation = styled.div`
  width: 100%;
  height: calc(350px - 30px);
  padding: 15px;
`;

export const ProductVariation = styled.div`
    width: 100%;
    padding: 15px;
    height: 100px;
    margin-bottom: 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

export const TitleVariation = styled.div`
  font-size: 1rem;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 700;
  padding-bottom: 15px;
`;

export const VariationArea = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
`;

export const VariationControl = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
`;

export const VariationLabel = styled.div`
  font-size: .8rem;
  font-weight: 700;
  font-family: 'Noto Sans',sans-serif;
`;

export const VariationOption = styled.div`
  width: 100%;
`;
